import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import axios from 'axios';

const axiosQ = axios.create({ withCredentials: true });

export const slice = createSlice({
  name: 'slice',
  initialState: initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    loginAC: (state, action) => {
      const { firstName, lastName, _id, favourites, startedProjects, finishedProjects } = action.payload
      state.user.isAuth = true
      state.user.firstName = firstName
      state.user.lastName = lastName
      state.user._id = _id
      state.user.favourites = favourites
      state.user.startedProjects = startedProjects
      state.user.finishedProjects = finishedProjects
      state.offers = state.offers.map(offer => {
        if (favourites.includes(offer._id))
          return { ...offer, isFavourite: true }
        else return offer
      });
    },

    addOffers: (state, action) => {
      const tags = []
      state.offers = action.payload.map(offer => {
        offer.tags.forEach(tag => tags.push(tag))
        return { ...offer, isFavourite: false, hasExpandedSize: false }
      })
      state.tags = [...new Set(tags)]
    },

    logoutAC: (state) => {
      state.user = {
        isAuth: false,
        _id: undefined,
        firstName: undefined,
        lastName: undefined,
        favourites: [],
        startedProjects: [],
        finishedProjects: []
      }
      state.offers = state.offers.map(offer => {
        return { ...offer, isFavourite: false }
      });
    },


    // Card sizes

    changeComponentSizeAC: (state, action) => {
      state.view.componentsSize = Number(action.payload)
    },


    expandCardAC: (state, action) => {
      state.offers = state.offers.map(offer => {
        if (offer._id === action.payload)
          return { ...offer, hasExpandedSize: true }
        else
          return { ...offer, hasExpandedSize: false }
      })
    },

    closeExpandedAC: (state) => {
      state.offers = state.offers.map(offer => {
        return { ...offer, hasExpandedSize: false }
      })
    },

    expandProjectCardAC: (state, action) => {
      state.user.startedProjects = state.user.startedProjects.map(offer => {
        if (offer._id === action.payload)
          return { ...offer, hasExpandedSize: true }
        else
          return { ...offer, hasExpandedSize: false }
      })
      state.user.finishedProjects = state.user.finishedProjects.map(offer => {
        if (offer._id === action.payload)
          return { ...offer, hasExpandedSize: true }
        else
          return { ...offer, hasExpandedSize: false }
      })
    },

    closeExpandedProjectCardAC: (state) => {
      state.user.startedProjects = state.user.startedProjects.map(project => {
        return { ...project, hasExpandedSize: false }
      })
      state.user.finishedProjects = state.user.finishedProjects.map(project => {
        return { ...project, hasExpandedSize: false }
      })
    },

    /// Filters 

    toggleFilterBudgetAC: state => {
      state.view.filterBudget = !state.view.filterBudget;
    },

    toggleFilterFavouritesAC: state => {
      state.view.filterFavourites = !state.view.filterFavourites;
    },

    filterSearchHandlerAC: (state, action) => {
      state.view.filterSearch = action.payload;
    },

    filterTagsSearchHandlerAC: (state, action) => {
      state.view.filterTagsSearch = action.payload;
    },

    addTagAC: (state, action) => {
      if (!state.view.filterTags.includes(action.payload))
        state.view.filterTags.push(action.payload)
    },

    removeTagAC: (state, action) => {
      state.view.filterTags = state.view.filterTags.filter(tag => tag !== action.payload)
    },

    changeSortOptionAC: (state, action) => {
      state.view.sortOption = action.payload;
    },


    // Pagination

    setCurrentPageAC: (state, action) => {
      state.view.currentPage = action.payload
    },

    setNumberOfOffersAC: (state, action) => {
      state.view.numberOfOffers = action.payload
    },


    // Favourites

    toggleFavouriteAC: (state, action) => {
      state.offers = state.offers.map(offer => {
        if (offer._id === action.payload)
          return { ...offer, isFavourite: !offer.isFavourite }
        else return offer
      })

      if (state.user.favourites.includes(action.payload))
        state.user.favourites = state.user.favourites.filter(el => el !== action.payload)
      else
        state.user.favourites.push(action.payload)
    },

    addToStartedProjectsAC: (state, action) => {
      // const offerIndex = state.offers.findIndex(offer => offer._id === action.payload._id)
      // console.log(offerIndex)
      // const project = state.user.splice(offerIndex, 1)
      state.user.startedProjects.push({ ...action.payload, hasExpandedSize: false })
      console.log(state.user.startedProjects)
    },

    // Profle
    setActiveTabAC: (state, action) => {
      state.view.profileActiveTab = action.payload
    }
  },
});

export const {
  loginAC,
  logoutAC,
  addOffers,
  changeComponentSizeAC,
  expandCardAC,
  closeExpandedAC,
  expandProjectCardAC,
  closeExpandedProjectCardAC,
  toggleFilterBudgetAC,
  toggleFilterFavouritesAC,
  filterSearchHandlerAC,
  filterTagsSearchHandlerAC,
  addTagAC,
  removeTagAC,
  changeSortOptionAC,
  setCurrentPageAC,
  setNumberOfOffersAC,
  toggleFavouriteAC,
  addToStartedProjectsAC,
  setActiveTabAC
} = slice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const fetchOffersThunk = () => async dispatch => {
  const response = await axiosQ('http://localhost:3003/offers');
  dispatch(addOffers(response.data.offers));
};

export const logoutThunk = () => async dispatch => {
  const response = await axiosQ.post('http://localhost:3003/logout')
  dispatch(logoutAC())
}

export const toggleFavouriteThunk = (payload) => async dispatch => {
  const response = await axiosQ.patch('http://localhost:3003/users/favourite', payload)
  console.log(response.data)
}

export const addToStartedProjectsThunk = (payload) => async dispatch => {
  const response = await axiosQ.post('http://localhost:3003/users/start', payload)
  console.log(response.data)
  dispatch(addToStartedProjectsAC(response.data))
  dispatch(toggleFavouriteAC(payload._id))
}


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = state => state.counter.value;

export default slice.reducer;
